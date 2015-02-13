using SillyChat.Models;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Transactions;
using System.Web;

namespace SillyChat.Repositories
{
    public class ChatRepository : IChatRepository
    {
        private readonly int _MaxUserCount = ConfigurationManager.AppSettings["MaxUserCount"] == null 
            ? 20 
            : int.Parse(ConfigurationManager.AppSettings["MaxUserCount"]);

        private ChatDbContext _Db = new ChatDbContext();

        public User AddUser(string userName)
        {
            var user = GetUser(userName);
            if(user == null)
            {
                string hexName = BitConverter.ToString(Encoding.Default.GetBytes(userName)).Replace("-", String.Empty);
                user = new User 
                { 
                    Name = userName,
                    AvatarUrl = String.Format("http://unicornify.appspot.com/avatar/{0}?s=50", hexName)
                };

                _Db.Users.Add(user);
                _Db.SaveChanges();
            }
            return user;
        }

        public User GetUser(string userName)
        {
            return _Db.Users.SingleOrDefault(x => x.Name.ToLower() == userName.ToLower());
        }

        public Message AddMessage(User user, string text)
        {
            if (user == null)
            {
                throw new ArgumentNullException("user");
            }

            var message = new Message { Author = user, Text = text, Date = DateTime.UtcNow };
            _Db.Messages.Add(message);
            _Db.SaveChanges();
            return message;
        }

        public IEnumerable<Message> GetLastMessages(int count)
        {
            return _Db.Messages
                .Include("Author")
                .OrderByDescending(x => x.Date)
                .Take(count)
                .ToList();
        }

        public bool TryJoin(User user)
        {
            if (user == null)
            {
                throw new ArgumentNullException("user");
            }

            using (var transaction = new TransactionScope())
            {
                if (_Db.Participants.Any(x => x.Id == user.Id))
                {
                    return true;
                }

                if (_Db.Participants.Count() >= _MaxUserCount) 
                {
                    return false;
                }

                _Db.Participants.Add(new Participant { User = user });
                _Db.SaveChanges();
                transaction.Complete();
                return true;
            }
        }

        public void Leave(User user)
        {
            if (user == null)
            {
                throw new ArgumentNullException("user");
            }

            var participant = _Db.Participants.SingleOrDefault(x => x.User.Id == user.Id);
            if (participant != null)
            {
                _Db.Participants.Remove(participant);
                _Db.SaveChanges();
            }
        }

        public IEnumerable<User> GetParticipants()
        {
            return _Db.Participants.Select(x => x.User).ToList();
        }


        public void Clear()
        {
            _Db.Database.Delete();
            _Db.Database.Initialize(false);
        }

    }
}