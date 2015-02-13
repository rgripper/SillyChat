using Newtonsoft.Json;
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
        private readonly IChatRepository _ChatRepo = new ChatRepository();

        public ActionResult Index()
        {
            ViewBag.Title = "Chat";

            if (this.User.Identity.IsAuthenticated && String.IsNullOrEmpty(this.User.Identity.Name))
            {
                FormsAuthentication.SignOut();
            }

            return View();
        }

        public ActionResult Clear()
        {
            _ChatRepo.Clear();
            FormsAuthentication.SignOut();
            return RedirectToAction("Index");
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
