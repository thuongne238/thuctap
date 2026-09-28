using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
namespace NtbSoft.ERP.Web.Controllers
{
    public class DeNghiThuHoiVatTuController : Controller
    {
        // GET: DeNghiThuHoiVatTu
        public ActionResult Index(string userName)
        {
            ViewBag.userName = userName;
            return View();
        }
        public ActionResult DeNghiThuHoiVatTuPL(string userName)
        {
            ViewBag.userName = userName;
            return View();
        }
    }
}