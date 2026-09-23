using System.Web.Mvc;

namespace DashboardTongQuanTienDo.Controllers
{
    /// <summary>
    /// Controller MVC thuần, chỉ để render trang View cho Dashboard.
    /// Tách riêng khỏi DashboardTongQuanTienDoController (ApiController) vì
    /// System.Web.Http.ApiController không thể trả về ActionResult/View.
    /// Toàn bộ dữ liệu JSON cho trang này do DashboardTongQuanTienDoController
    /// (api/Web API) cung cấp.
    /// </summary>
    public class DashboardTongQuanTienDoPageController : Controller
    {
        public ActionResult MerchandiserDashboard()
        {
            // Chỉ định rõ đường dẫn View cũ để không phải di chuyển thư mục Views
            return View();
        }
        public ActionResult testgiaodien()
        {
            // Chỉ định rõ đường dẫn View cũ để không phải di chuyển thư mục Views
            return View();
        }
        public ActionResult TongQuanTinhHinh()
        {
            // Chỉ định rõ đường dẫn View cũ để không phải di chuyển thư mục Views
            return View();
        }
        public ActionResult dongbogiaodien()
        {
            // Chỉ định rõ đường dẫn View cũ để không phải di chuyển thư mục Views
            return View();
        }
    }
}
