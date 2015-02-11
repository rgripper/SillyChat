using Microsoft.AspNet.SignalR;
using SillyChat.Repositories;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
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
    }

    public interface IChatServer
    {
        void AddMessage(string text);
    }

    public class ChatHub : Hub<IChatClient>, IChatServer
    {
        private readonly IChatRepository _ChatRepo = new DummyChatRepository();

        private readonly ChatState _ChatState = new ChatState();

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

        public override Task OnDisconnected(bool stopCalled)
        {
            if (this.Context.User.Identity.IsAuthenticated)
            {
                var user = this.CurrentUser;
                if (user != null) // not orphaned
                {
                    _ChatState.Leave(user);
                    Clients.Others.RemoveParticipant(user.Id);
                }
            }
            return base.OnDisconnected(stopCalled);
        }

        public override Task OnConnected()
        {
            if (this.Context.User.Identity.IsAuthenticated)
            {
                var user = this.CurrentUser;
                if (user != null)
                {
                    Join(user);
                }
            }
            return base.OnConnected();
        }

        private void Join(User user)
        {
            if (_ChatState.TryJoin(user))
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
            var messages = _ChatRepo.GetMessages();
            Clients.Caller.Init(user, _ChatState.Participants, messages);
        }
    }

    public class ChatState
    {
        private readonly int _MaxUserCount = 20;

        private static Dictionary<int, User> _Participants = new Dictionary<int, User>();

        private static readonly object Locker = new object();

        public IEnumerable<User> Participants
        {
            get
            {
                lock (Locker)
                {
                    return _Participants.Values.ToList();
                }
            }
        }

        public bool TryJoin(User user)
        {
            if (user == null)
            {
                throw new ArgumentNullException("user");
            }

            lock (Locker)
            {
                if (_Participants.ContainsKey(user.Id)) // already there
                {
                    return true;
                }

                if (_Participants.Count >= _MaxUserCount) // too many
                {
                    return false;
                }

                _Participants.Add(user.Id, user);
                return true;
            }
        }

        public void Leave(User user)
        {
            lock (Locker)
            {
                _Participants.Remove(user.Id);
            }
        }
    }
}