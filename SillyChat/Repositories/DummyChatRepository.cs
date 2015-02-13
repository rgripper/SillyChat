using SillyChat.Models;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;

namespace SillyChat.Repositories
{
    public class DummyChatRepository : IChatRepository
    {
        private static readonly ConcurrentDictionary<string, User> Users = new ConcurrentDictionary<string, User>();

        private static readonly ConcurrentBag<Message> Messages = new ConcurrentBag<Message>();

        public User AddUser(string userName)
        {
            if (String.IsNullOrEmpty(userName))
            {
                throw new ArgumentException("userName");
            }

            var user = GetUser(userName);
            if (user != null)
            {
                return user;
            }

            int newId = Users.Count + 1; // NOTE: race condition
            user = new User
            {
                Id = newId,
                Name = userName,
                AvatarUrl = String.Format("http://unicornify.appspot.com/avatar/{0}?s=50", newId)
            };

            if (Users.TryAdd(user.Name, user))
            {
                return user;
            }

            throw new Exception("Could not add user");
        }

        public User GetUser(string userName)
        {
            User user = null;
            Users.TryGetValue(userName, out user);
            return user;
        }

        public Message AddMessage(User user, string text)
        {
            int newId = Messages.Count + 1; // NOTE: race condition
            var message = new Message { Id = newId, Author = user, Date = DateTime.Now, Text = text };
            Messages.Add(message);
            return message;
        }

        public IEnumerable<Message> GetLastMessages(int count)
        {
            return Messages.OrderByDescending(x => x.Date).Take(count).ToList();
        }


        private readonly int _MaxUserCount = ConfigurationManager.AppSettings["MaxUserCount"] == null ? 20 : int.Parse(ConfigurationManager.AppSettings["MaxUserCount"]);

        private Dictionary<int, User> _Participants = new Dictionary<int, User>();

        private readonly object Locker = new object();

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

        public IEnumerable<User> GetParticipants()
        {
            return _Participants.Values.ToList();
        }


        public void Clear()
        {
            throw new NotImplementedException();
        }
    }
}