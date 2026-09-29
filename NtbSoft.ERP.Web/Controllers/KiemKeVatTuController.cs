using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace BaoCaoTongHop.Controllers
{
    public class KiemKeVatTuController : Controller
    {
       
        public ActionResult KiemKeVTNL(string userName)
        {
            ViewBag.userName = userName;
            return View();
        }
        public ActionResult KiemKeVTPL(string userName)
        {
            ViewBag.userName = userName;
            return View();
        }
    }
}