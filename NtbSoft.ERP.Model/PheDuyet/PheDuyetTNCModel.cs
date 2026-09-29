using NtbSoft.ERP.Entity.PheDuyet;
using NtbSoft.ERP.Entity.SYSTEM;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NtbSoft.ERP.Model.PheDuyet
{
   public class PheDuyetTNCModel
    {
        #region Get
        public async Task<DataTable> GetSize(string malenh, string sizetypeID, string spoid, string colorid)
        {
            SqlConnection conn = null;
            try
            {
                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnectionSX();
                SqlCommand cmd = new SqlCommand("SP_ERP_NHAP_TNC", conn);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 3000;
                cmd.Parameters.AddWithValue("@Action", "GET_SIZE");
                cmd.Parameters.AddWithValue("@SoBo", 0);
                cmd.Parameters.AddWithValue("@CutTable", 0);
                cmd.Parameters.AddWithValue("@SPOID", spoid);
                cmd.Parameters.AddWithValue("@SizeTypeID", sizetypeID);
                cmd.Parameters.AddWithValue("@ColorID", colorid);
                cmd.Parameters.AddWithValue("@Code_TNC", 0);
                cmd.Parameters.AddWithValue("@MaLenh", malenh);
                cmd.Parameters.AddWithValue("@Allow", 0);
                cmd.Parameters.AddWithValue("@ProductID", 0);
                cmd.Parameters.AddWithValue("@NhomNPL", 0);
                cmd.Parameters.AddWithValue("@Size", 0);
                cmd.Parameters.AddWithValue("@MaKH", 0);
                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    var tb = new DataTable();
                    tb.Load(reader);
                    return tb;
                }
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
                System.Diagnostics.Debug.WriteLine(ex.Message);
            }
            finally { if (conn != null) { conn.Close(); conn.Dispose(); } }
        }
        public async Task<DataTable> GetSoDoEdit(string codetnc)
        {
            SqlConnection conn = null;
            try
            {
                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnectionSX();
                SqlCommand cmd = new SqlCommand("SP_ERP_NHAP_TNC", conn);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 3000;
                cmd.Parameters.AddWithValue("@Action", "GetSoDoEdit");
                cmd.Parameters.AddWithValue("@SoBo", 0);
                cmd.Parameters.AddWithValue("@CutTable", 0);
                cmd.Parameters.AddWithValue("@SPOID", 0);
                cmd.Parameters.AddWithValue("@SizeTypeID", 0);
                cmd.Parameters.AddWithValue("@ColorID", 0);
                cmd.Parameters.AddWithValue("@Code_TNC", codetnc);
                cmd.Parameters.AddWithValue("@MaLenh", 0);
                cmd.Parameters.AddWithValue("@Allow", 0);
                cmd.Parameters.AddWithValue("@ProductID", 0);
                cmd.Parameters.AddWithValue("@NhomNPL", 0);
                cmd.Parameters.AddWithValue("@Size", 0);
                cmd.Parameters.AddWithValue("@MaKH", 0);
                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    var tb = new DataTable();
                    tb.Load(reader);
                    return tb;
                }
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
                System.Diagnostics.Debug.WriteLine(ex.Message);
            }
            finally { if (conn != null) { conn.Close(); conn.Dispose(); } }
        }
        public async Task<DataTable> GetSLDM(string malenh, string sizetypeID, string spoid, string colorid)
        {
            SqlConnection conn = null;
            try
            {
                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnectionSX();
                SqlCommand cmd = new SqlCommand("SP_ERP_NHAP_TNC", conn);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 3000;
                cmd.Parameters.AddWithValue("@Action", "GET_SL_DM");
                cmd.Parameters.AddWithValue("@SoBo", 0);
                cmd.Parameters.AddWithValue("@CutTable", 0);
                cmd.Parameters.AddWithValue("@SPOID", spoid);
                cmd.Parameters.AddWithValue("@SizeTypeID", sizetypeID);
                cmd.Parameters.AddWithValue("@ColorID", colorid);
                cmd.Parameters.AddWithValue("@Code_TNC", 0);
                cmd.Parameters.AddWithValue("@MaLenh", malenh);
                cmd.Parameters.AddWithValue("@Allow", 0);
                cmd.Parameters.AddWithValue("@ProductID", 0);
                cmd.Parameters.AddWithValue("@NhomNPL", 0);
                cmd.Parameters.AddWithValue("@Size", 0);
                cmd.Parameters.AddWithValue("@MaKH", 0);
                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    var tb = new DataTable();
                    tb.Load(reader);
                    return tb;
                }
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
                System.Diagnostics.Debug.WriteLine(ex.Message);
            }
            finally { if (conn != null) { conn.Close(); conn.Dispose(); } }
        }
        public async Task<DataTable> GetParameterTNC(string CodeTNC)
        {
            SqlConnection conn = null;
            try
            {
                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection();
                SqlCommand cmd = new SqlCommand("SP_ERPDonHangTong", conn);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 3000;
                cmd.Parameters.AddWithValue("Action", "GetSPOID");
                cmd.Parameters.AddWithValue("@Parameter", CodeTNC ?? "");
                cmd.Parameters.AddWithValue("@Parameter2", DBNull.Value);
                cmd.Parameters.AddWithValue("@Parameter3", DBNull.Value);
                cmd.Parameters.AddWithValue("@Parameter4", DBNull.Value);
                cmd.Parameters.AddWithValue("@Parameter5", DBNull.Value);
                cmd.Parameters.AddWithValue("@Parameter6", DBNull.Value);
                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    var tb = new DataTable();
                    tb.Load(reader);
                    return tb;
                }
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
                System.Diagnostics.Debug.WriteLine(ex.Message);
            }
            finally { if (conn != null) { conn.Close(); conn.Dispose(); } }
        }
        public async Task<List<ErpHangHoaEntity>> GetHangHoa(string MaLenh)
        {
            SqlConnection conn = null;
            try
            {
                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnectionSX();
                SqlCommand cmd = new SqlCommand("SP_ERP_HANGHOA", conn);
                cmd.CommandTimeout = 3000;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Action", "GET");
                cmd.Parameters.AddWithValue("@ProductID", 0);
                cmd.Parameters.AddWithValue("@StyleID", MaLenh);
                cmd.Parameters.AddWithValue("@SizeTypeID", 0);
                cmd.Parameters.AddWithValue("@ColorID", 0);
                cmd.Parameters.AddWithValue("@SizeID", 0);
                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    var tb = new DataTable();
                    tb.Load(reader);
                    NtbSoft.ERP.Libs.clsConvert<ErpHangHoaEntity> convert = new Libs.clsConvert<ErpHangHoaEntity>();

                    return convert.ToList(tb);
                }
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
                System.Diagnostics.Debug.WriteLine(ex.Message);
            }
            finally { if (conn != null) { conn.Close(); conn.Dispose(); } }
        }
        public async Task<DataTable> GetGopPOEdit(string codetnc)
        {
            SqlConnection conn = null;
            try
            {
                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnectionSX();
                SqlCommand cmd = new SqlCommand("SP_ERP_NHAP_TNC", conn);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 3000;
                cmd.Parameters.AddWithValue("@Action", "GetGopPOEdit");
                cmd.Parameters.AddWithValue("@SoBo", 0);
                cmd.Parameters.AddWithValue("@CutTable", 0);
                cmd.Parameters.AddWithValue("@SPOID", 0);
                cmd.Parameters.AddWithValue("@SizeTypeID", 0);
                cmd.Parameters.AddWithValue("@ColorID", 0);
                cmd.Parameters.AddWithValue("@Code_TNC", codetnc);
                cmd.Parameters.AddWithValue("@MaLenh", 0);
                cmd.Parameters.AddWithValue("@Allow", 0);
                cmd.Parameters.AddWithValue("@ProductID", 0);
                cmd.Parameters.AddWithValue("@NhomNPL", 0);
                cmd.Parameters.AddWithValue("@Size", 0);
                cmd.Parameters.AddWithValue("@MaKH", 0);
                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    var tb = new DataTable();
                    tb.Load(reader);
                    return tb;
                }
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
                System.Diagnostics.Debug.WriteLine(ex.Message);
            }
            finally { if (conn != null) { conn.Close(); conn.Dispose(); } }
        }
        public async Task<DataTable> HasDataInHachToan(string malenh, string codetnc)
        {
            SqlConnection conn = null;
            try
            {
                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnectionSX();
                SqlCommand cmd = new SqlCommand("SP_ERP_NHAP_TNC", conn);
                cmd.CommandTimeout = 3000;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Action", "HasDataInHachToan");
                cmd.Parameters.AddWithValue("@SoBo", 0);
                cmd.Parameters.AddWithValue("@CutTable", 0);
                cmd.Parameters.AddWithValue("@SPOID", 0);
                cmd.Parameters.AddWithValue("@SizeTypeID", 0);
                cmd.Parameters.AddWithValue("@ColorID", 0);
                cmd.Parameters.AddWithValue("@Code_TNC", codetnc ?? "");
                cmd.Parameters.AddWithValue("@MaLenh", malenh ?? "");
                cmd.Parameters.AddWithValue("@Allow", 0);
                cmd.Parameters.AddWithValue("@ProductID", 0);
                cmd.Parameters.AddWithValue("@NhomNPL", 0);
                cmd.Parameters.AddWithValue("@Size", 0);
                cmd.Parameters.AddWithValue("@MaKH", 0);
                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    var tb = new DataTable();
                    tb.Load(reader);
                    return tb;
                }
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
                System.Diagnostics.Debug.WriteLine(ex.Message);
            }
            finally { if (conn != null) { conn.Close(); conn.Dispose(); } }
        }
        #endregion

        #region POST 
        public async Task<bool> CheckDuyetSD(string codetnc, bool checkDSD)
        {
            SqlConnection conn = null;
            try
            {
                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnectionSX();
                SqlCommand cmd = new SqlCommand("SP_ERP_NHAP_TNC", conn);
                cmd.CommandTimeout = 3000;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Action", "CHECKDuyetSD");
                cmd.Parameters.AddWithValue("@SoBo", 0);
                cmd.Parameters.AddWithValue("@CutTable", 0);
                cmd.Parameters.AddWithValue("@SPOID", 0);
                cmd.Parameters.AddWithValue("@SizeTypeID", 0);
                cmd.Parameters.AddWithValue("@ColorID", 0);
                cmd.Parameters.AddWithValue("@Code_TNC", codetnc);
                cmd.Parameters.AddWithValue("@MaLenh", 0);
                cmd.Parameters.AddWithValue("@Allow", checkDSD);
                cmd.Parameters.AddWithValue("@ProductID", 0);
                cmd.Parameters.AddWithValue("@NhomNPL", 0);
                cmd.Parameters.AddWithValue("@Size", 0);
                cmd.Parameters.AddWithValue("@MaKH", 0);
                await cmd.ExecuteNonQueryAsync();
                return true;

            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
                System.Diagnostics.Debug.WriteLine(ex.Message);
            }
            finally
            {
                if (conn != null) conn.Close(); conn.Dispose();
            }
        }
        public async Task<string> POST_ERP_CUT_VP(List<ErpTNC_VpConfig> items)
        {
            NtbSoft.ERP.Libs.clsConvert<ErpTNC_VpConfig> convert = new Libs.clsConvert<ErpTNC_VpConfig>();
            DataTable tb = convert.ToDataTable(items);
            SqlConnection conn = null;
            try
            {
                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnectionSX();
                SqlCommand cmd = new SqlCommand("SP_ERP_CUT_VP", conn);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 3000;
                cmd.Parameters.AddWithValue("@Action", "POST");
                cmd.Parameters.AddWithValue("@MaLenh", 0);
                cmd.Parameters.AddWithValue("@SPOID", 0);
                cmd.Parameters.AddWithValue("@MauVai", 0);
                cmd.Parameters.AddWithValue("@Size", 0);
                cmd.Parameters.AddWithValue("@MaVai", 0);
                cmd.Parameters.AddWithValue("@MaHang", 0);
                cmd.Parameters.AddWithValue("@KhoVai", 0);
                cmd.Parameters.AddWithValue("@BanCat", 0);
                cmd.Parameters.AddWithValue("@SoBo", 0);
                cmd.Parameters.AddWithValue("@ProductID", 0);
                cmd.Parameters.AddWithValue("@Code_TNC", 0);
                cmd.Parameters.AddWithValue("@TypeTable", tb);
                await cmd.ExecuteNonQueryAsync();

                return "True";

            }
            catch (SqlException ex)
            {
                System.Diagnostics.Debug.WriteLine(ex.Message);
                return ex.Message;

            }
            finally { if (conn != null) { conn.Close(); conn.Dispose(); } }
        }
        public async Task<string> Post_ERP_CUT_SOBO_VP(List<ErpCutSoBo_VPConfig> items)
        {
            NtbSoft.ERP.Libs.clsConvert<ErpCutSoBo_VPConfig> convert = new Libs.clsConvert<ErpCutSoBo_VPConfig>();
            DataTable tb = convert.ToDataTable(items);
            SqlConnection conn = null;
            try
            {
                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnectionSX();
                SqlCommand cmd = new SqlCommand("SP_ERP_CUT_SOBO_VP", conn);
                cmd.CommandTimeout = 3000;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Action", "POST");
                cmd.Parameters.AddWithValue("@SPOID", 0);
                cmd.Parameters.AddWithValue("@DepID", 0);
                cmd.Parameters.AddWithValue("@SizeTypeID", 0);
                cmd.Parameters.AddWithValue("@CutTable", 0);
                cmd.Parameters.AddWithValue("@ColorID", 0);
                cmd.Parameters.AddWithValue("@ProductID", 0);
                cmd.Parameters.AddWithValue("@SoBo", 0);
                cmd.Parameters.AddWithValue("@Code_TNC", 0);
                cmd.Parameters.AddWithValue("@TypeTable", tb);
                await cmd.ExecuteNonQueryAsync();

                return "True";

            }
            catch (SqlException ex)
            {
                System.Diagnostics.Debug.WriteLine(ex.Message);
                return ex.Message;
            }
            finally { if (conn != null) { conn.Close(); conn.Dispose(); } }
        }
        public async Task<string> Post_ERP_GOP_PO(List<ErpGopPOConfig> items)
        {
            NtbSoft.ERP.Libs.clsConvert<ErpGopPOConfig> convert = new Libs.clsConvert<ErpGopPOConfig>();
            DataTable tb = convert.ToDataTable(items);
            SqlConnection conn = null;
            try
            {
                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnectionSX();
                SqlCommand cmd = new SqlCommand("SP_ERP_GOP_PO", conn);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 30000;
                cmd.Parameters.AddWithValue("@Action", "POST");
                cmd.Parameters.AddWithValue("@MaLenh", 0);
                cmd.Parameters.AddWithValue("@POTong", 0);
                cmd.Parameters.AddWithValue("@PageIndex", 0);
                cmd.Parameters.AddWithValue("@PageSize", 0);
                cmd.Parameters.AddWithValue("@SPOID", 0);
                cmd.Parameters.AddWithValue("@StyleID", 0);
                cmd.Parameters.AddWithValue("@SizeTypeID", 0);
                cmd.Parameters.AddWithValue("@MaVai", 0);
                cmd.Parameters.AddWithValue("@Mau", 0);
                cmd.Parameters.AddWithValue("@SL_TNC", 0);
                cmd.Parameters.AddWithValue("@TypeTable", tb);
                await cmd.ExecuteNonQueryAsync();

                return "True";

            }
            catch (SqlException ex)
            {
                System.Diagnostics.Debug.WriteLine(ex.Message);
                return ex.Message;
            }
            finally { if (conn != null) { conn.Close(); conn.Dispose(); } }
        }

        public async Task<string> Post_ERP_LENHSX_PO_CUT_DETAIL(List<ErpLenhSXPOCutDetailConfig> items)
        {
            NtbSoft.ERP.Libs.clsConvert<ErpLenhSXPOCutDetailConfig> convert = new Libs.clsConvert<ErpLenhSXPOCutDetailConfig>();
            DataTable tb = convert.ToDataTable(items);
            SqlConnection conn = null;
            try
            {
                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnectionSX();
                SqlCommand cmd = new SqlCommand("SP_ERP_LENHSX_PO_CUT_DETAIL", conn);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 3000;
                cmd.Parameters.AddWithValue("@Action", "POST");
                cmd.Parameters.AddWithValue("@ProductID", 0);
                cmd.Parameters.AddWithValue("@SizeTypeID", 0);
                cmd.Parameters.AddWithValue("@DepID", 0);
                cmd.Parameters.AddWithValue("@SPOID", 0);
                cmd.Parameters.AddWithValue("@CutTable", 0);
                cmd.Parameters.AddWithValue("@ColorID", 0);
                cmd.Parameters.AddWithValue("@Mavai", 0);
                cmd.Parameters.AddWithValue("@Code_TNC", 0);
                cmd.Parameters.AddWithValue("@TypeTable", tb);
                await cmd.ExecuteNonQueryAsync();

                return "True";

            }
            catch (SqlException ex)
            {
                System.Diagnostics.Debug.WriteLine(ex.Message);
                return ex.Message;
            }
            finally { if (conn != null) { conn.Close(); conn.Dispose(); } }
        }
        public async Task<string> Post_ERP_LENHSX_PO_CUT_SOBO(List<ErpLenhSXPOCutSoBoConfig> items)
        {
            NtbSoft.ERP.Libs.clsConvert<ErpLenhSXPOCutSoBoConfig> convert = new Libs.clsConvert<ErpLenhSXPOCutSoBoConfig>();
            DataTable tb = convert.ToDataTable(items);
            SqlConnection conn = null;
            try
            {
                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnectionSX();
                SqlCommand cmd = new SqlCommand("SP_ERP_LENHSX_PO_CUT_SOBO", conn);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 3000;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Action", "POST");
                cmd.Parameters.AddWithValue("@ProductID", 0);
                cmd.Parameters.AddWithValue("@SPOID", 0);
                cmd.Parameters.AddWithValue("@CutTable", 0);
                cmd.Parameters.AddWithValue("@SoBo", 0);
                cmd.Parameters.AddWithValue("@SizeTypeID", 0);
                cmd.Parameters.AddWithValue("@ColorID", 0);
                cmd.Parameters.AddWithValue("@SoPhieu", 0);
                cmd.Parameters.AddWithValue("@ReciveDate", DateTime.Now);
                cmd.Parameters.AddWithValue("@DepID", 0);
                cmd.Parameters.AddWithValue("@Malenh", 0);
                cmd.Parameters.AddWithValue("@Code_TNC", 0);
                cmd.Parameters.AddWithValue("@FromDate", 0);
                cmd.Parameters.AddWithValue("@ToDate", 0);
                cmd.Parameters.AddWithValue("@Status", 0);
                cmd.Parameters.AddWithValue("@TypeTable", tb);
                await cmd.ExecuteNonQueryAsync();

                return "True";

            }
            catch (SqlException ex)
            {
                System.Diagnostics.Debug.WriteLine(ex.Message);
                return ex.Message;
            }
            finally { if (conn != null) { conn.Close(); conn.Dispose(); } }
        }

        public async Task<string> Post_ERP_LENHSX_PO_CUT_IMPORT(List<ErpLenhSXPOCutImportConfig> items)
        {
            NtbSoft.ERP.Libs.clsConvert<ErpLenhSXPOCutImportConfig> convert = new Libs.clsConvert<ErpLenhSXPOCutImportConfig>();
            DataTable tb = convert.ToDataTable(items);
            SqlConnection conn = null;
            try
            {
                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnectionSX();
                SqlCommand cmd = new SqlCommand("SP_ERP_LENHSX_PO_CUT_IMPORT", conn);
                cmd.CommandTimeout = 3000;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Action", "POST");
                cmd.Parameters.AddWithValue("@ProductID", 0);
                cmd.Parameters.AddWithValue("@SPOID", 0);
                cmd.Parameters.AddWithValue("@CutTable", 0);
                cmd.Parameters.AddWithValue("@SoBo", 0);
                cmd.Parameters.AddWithValue("@SizeTypeID", 0);
                cmd.Parameters.AddWithValue("@ColorID", 0);
                cmd.Parameters.AddWithValue("@SoPhieu", 0);
                cmd.Parameters.AddWithValue("@ReciveDate", DateTime.Now);
                cmd.Parameters.AddWithValue("@CreatedDate", 0);
                cmd.Parameters.AddWithValue("@DepID", 0);
                cmd.Parameters.AddWithValue("@Malenh", 0);
                cmd.Parameters.AddWithValue("@MaVai", 0);
                cmd.Parameters.AddWithValue("@Code_TNC", 0);
                cmd.Parameters.AddWithValue("@Allow", 0);
                cmd.Parameters.AddWithValue("@SL", 0);
                cmd.Parameters.AddWithValue("@IsChon", 0);
                cmd.Parameters.AddWithValue("@TypeTable", tb);
                await cmd.ExecuteNonQueryAsync();

                return "True";

            }
            catch (SqlException ex)
            {
                System.Diagnostics.Debug.WriteLine(ex.Message);
                return ex.Message;
            }
            finally { if (conn != null) { conn.Close(); conn.Dispose(); } }
        }

        public async Task<string> Post_ERP_LENHSX_PO(List<ErpLenhSXPOConfig> items)
        {
            NtbSoft.ERP.Libs.clsConvert<ErpLenhSXPOConfig> convert = new Libs.clsConvert<ErpLenhSXPOConfig>();
            DataTable tb = convert.ToDataTable(items);
            SqlConnection conn = null;
            try
            {
                if (tb.Columns.Contains("Vendor"))
                {
                    tb.Columns.Remove("Vendor");
                }

                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnectionSX();
                SqlCommand cmd = new SqlCommand("SP_ERP_LENHSX_PO", conn);
                cmd.CommandTimeout = 3000;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Action", "POST");
                cmd.Parameters.AddWithValue("@MaLenh", 0);
                cmd.Parameters.AddWithValue("@SPOID", 0);
                cmd.Parameters.AddWithValue("@TenLenh", 0);
                cmd.Parameters.AddWithValue("@ID", 0);
                cmd.Parameters.AddWithValue("@DepID", 0);
                cmd.Parameters.AddWithValue("@allow", 0);
                cmd.Parameters.AddWithValue("@Code_TNC", 0);
                cmd.Parameters.AddWithValue("@TypeTable", tb);
                await cmd.ExecuteNonQueryAsync();
                return "True";

            }
            catch (SqlException ex)
            {
                System.Diagnostics.Debug.WriteLine(ex.Message);
                return ex.Message;
            }
            finally { if (conn != null) { conn.Close(); conn.Dispose(); } }
        }
        

        public async Task<bool> AllowCut(string MaLenh, string MaVai, string dmtt, string thtt)
          {
            SqlConnection conn = null;
            try
            {
                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnectionSX();
                SqlCommand cmd = new SqlCommand("SP_ERP_DINHMUC_NL", conn);
                cmd.CommandTimeout = 3000;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Action", "ALLOWCUT");
                cmd.Parameters.AddWithValue("@MaLenh", MaLenh);
                cmd.Parameters.AddWithValue("@ID", dmtt);
                cmd.Parameters.AddWithValue("@PageIndex", 0);
                cmd.Parameters.AddWithValue("@PageSize", 0);
                cmd.Parameters.AddWithValue("@SPOID", 0);
                cmd.Parameters.AddWithValue("@MaVatTu", 0);
                cmd.Parameters.AddWithValue("@MaNPL", 0);
                cmd.Parameters.AddWithValue("@MaVai", MaVai);
                cmd.Parameters.AddWithValue("@SizeTypeID", 0);
                cmd.Parameters.AddWithValue("@status_v", thtt);
                //using (SqlDataAdapter adt = new SqlDataAdapter(cmd))
                //{
                //    DataTable ds = new DataTable();
                //    adt.Fill(ds);
                //    return ds;
                //}
                await cmd.ExecuteNonQueryAsync();

                return true;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine(ex.Message);
                throw new Exception(ex.Message);

            }
            finally
            {
                if (conn != null) { conn.Close(); conn.Dispose(); }
            }
        }

        public async Task<string> AllowPack(string maLenh)
        {
            SqlConnection conn = null;
            try
            {
                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnectionSX();
                SqlCommand cmd = new SqlCommand("SP_ERP_LENHSX_PO_DINHMUC", conn);
                cmd.CommandTimeout = 3000;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Action", "ALLOWPACK");
                cmd.Parameters.AddWithValue("@MaLenh", maLenh);
                cmd.Parameters.AddWithValue("@SPOID", 0);
                cmd.Parameters.AddWithValue("@ProductID", 0);
                cmd.Parameters.AddWithValue("@StyleID", 0);
                cmd.Parameters.AddWithValue("@SizeTypeID", 0);
                cmd.Parameters.AddWithValue("@DepID", 0);
                cmd.Parameters.AddWithValue("@ColorID", 0);              
                await cmd.ExecuteNonQueryAsync();

                return "True";
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine(ex.Message);
                throw new Exception(ex.Message);

            }
            finally
            {
                if (conn != null) { conn.Close(); conn.Dispose(); }
            }
        }
        public async Task<string> AllowCutDep(string maLenh)
        {
            SqlConnection conn = null;
            try
            {
                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnectionSX();
                SqlCommand cmd = new SqlCommand("SP_ERP_LENHSX_PO_DINHMUC", conn);            
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Action", "ALLOWCUTDEP");
                cmd.CommandTimeout = 3000;
                cmd.Parameters.AddWithValue("@MaLenh", maLenh);
                cmd.Parameters.AddWithValue("@SPOID", 0);
                cmd.Parameters.AddWithValue("@ProductID", 0);
                cmd.Parameters.AddWithValue("@StyleID", 0);
                cmd.Parameters.AddWithValue("@SizeTypeID", 0);
                cmd.Parameters.AddWithValue("@DepID", 0);
                cmd.Parameters.AddWithValue("@ColorID", 0);
                await cmd.ExecuteNonQueryAsync();

                return "True";
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine(ex.Message);
                throw new Exception(ex.Message);

            }
            finally
            {
                if (conn != null) { conn.Close(); conn.Dispose(); }
            }
        }

        //Write log
        public async Task<string> Post_SystemLog(List<SystemLogConfig> items)
        {
            NtbSoft.ERP.Libs.clsConvert<SystemLogConfig> convert = new Libs.clsConvert<SystemLogConfig>();
            DataTable tb = convert.ToDataTable(items);
            SqlConnection conn = null;
            try
            {
                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnectionSX();
              
                SqlCommand cmd = new SqlCommand("SP_SYS_LOG", conn);
                cmd.CommandTimeout = 3000;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Action", "POST");
                cmd.Parameters.AddWithValue("@ID", 0);
                cmd.Parameters.AddWithValue("@FromDate", DateTime.Now);
                cmd.Parameters.AddWithValue("@ToDate", DateTime.Now);
                cmd.Parameters.AddWithValue("@TypeTable", tb);             
                await cmd.ExecuteNonQueryAsync();

                return "True";

            }
            catch (SqlException ex)
            {
                System.Diagnostics.Debug.WriteLine(ex.Message);
                return ex.Message;
            }
            finally { if (conn != null) { conn.Close(); conn.Dispose(); } }
        }

        #endregion

        #region Delete
        public async Task<string> Delete_ERP_GOP_PO(string id)
        {
            SqlConnection conn = null;
            try
            {
                conn = NtbSoft.ERP.Libs.SqlHelper.GetConnectionSX();
                SqlCommand cmd = new SqlCommand("SP_ERP_GOP_PO", conn);
                cmd.CommandTimeout = 3000;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Action", "DELETE");
                cmd.Parameters.AddWithValue("@MaLenh", 0);
                cmd.Parameters.AddWithValue("@POTong", 0);
                cmd.Parameters.AddWithValue("@PageIndex", 0);
                cmd.Parameters.AddWithValue("@PageSize", 0);
                cmd.Parameters.AddWithValue("@SPOID", id);
                cmd.Parameters.AddWithValue("@StyleID", 0);
                cmd.Parameters.AddWithValue("@SizeTypeID", 0);
                cmd.Parameters.AddWithValue("@MaVai", 0);
                cmd.Parameters.AddWithValue("@Mau", 0);
                cmd.Parameters.AddWithValue("@SL_TNC", 0);
                await  cmd.ExecuteNonQueryAsync();
                return "True";
            }
            catch (SqlException ex)
            {
                System.Diagnostics.Debug.WriteLine(ex.Message);
                return ex.Message;
            }
            finally { if (conn != null) { conn.Close(); conn.Dispose(); } }
        }
    
        #endregion
    }
}
