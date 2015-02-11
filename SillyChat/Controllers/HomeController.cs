using SillyChat.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;

namespace SillyChat.Controllers
{
    public class HomeController : Controller
    {
        private readonly IChatRepository _ChatRepo = new DummyChatRepository();

        public ActionResult Index()
        {
            ViewBag.Title = "Home Page";

            return View();
        }

        [HttpPost]
        public ActionResult SignIn(string name)
        {
            var user = _ChatRepo.GetUser(name);
            if (user == null)
            {
                user = _ChatRepo.AddUser(name);
            }

            FormsAuthentication.SetAuthCookie(name, true);

            return Json(new { success = user != null });
        }

        [HttpPost]
        public ActionResult SignOut()
        {
            FormsAuthentication.SignOut();
            return new EmptyResult();
        }
    }
}
