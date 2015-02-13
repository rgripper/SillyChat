using Microsoft.AspNet.SignalR;
using SillyChat.Repositories;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Security;

namespace SillyChat.Models
{
    public interface IChatClient
    {
        void Init(User owner, IEnumerable<User> users, IEnumerable<Message> messages);

        void SetTooManyUsers();

        void AddParticipant(User user);

        void RemoveParticipant(int userId);

        void AddMessage(Message message);

        void SetDraftText(int userId, string text);
    }

    public interface IChatServer
    {
        void AddMessage(string text);

        void SetDraftText(string text);

        void Join();
    }

    public class ChatHub : Hub<IChatClient>, IChatServer
    {
        private readonly IChatRepository _ChatRepo = new ChatRepository();

        private User CurrentUser
        {
            get
            {
                return this.Context.User.Identity.IsAuthenticated ? _ChatRepo.GetUser(this.Context.User.Identity.Name) : null;
            }
        }

        [Authorize]
        public void AddMessage(string text)
        {
            var message = _ChatRepo.AddMessage(this.CurrentUser, text);
            Clients.All.AddMessage(message);
        }

        [Authorize]
        public void SetDraftText(string text)
        {
            Clients.Others.SetDraftText(this.CurrentUser.Id, text);
        }

        [Authorize]
        public void Join ()
        {
            Join(this.CurrentUser);
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            if (this.Context.User.Identity.IsAuthenticated)
            {
                var user = this.CurrentUser;
                if (user != null) // not orphaned
                {
                    _ChatRepo.Leave(user);
                    Clients.Others.RemoveParticipant(user.Id);
                }
            }
            return base.OnDisconnected(stopCalled);
        }

        private void Join(User user)
        {
            if (_ChatRepo.TryJoin(user))
            {
                Clients.Others.AddParticipant(user);
                Initialize(user);
            }
            else
            {
                Clients.Caller.SetTooManyUsers();
            }
        }

        private void Initialize(User user)
        {
            var messages = _ChatRepo.GetLastMessages(15);
            Clients.Caller.Init(user, _ChatRepo.GetParticipants(), messages);
        }


    }
}