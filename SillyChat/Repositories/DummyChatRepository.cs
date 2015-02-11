using SillyChat.Models;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
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

        public IEnumerable<Message> GetMessages()
        {
            return Messages.ToList();
        }
    }
}