using SillyChat.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SillyChat.Repositories
{
    public interface IChatRepository
    {
        User AddUser(string userName);

        User GetUser(string userName);

        Message AddMessage(User user, string text);

        IEnumerable<Message> GetLastMessages(int count);

        IEnumerable<User> GetParticipants();

        bool TryJoin(User user);

        void Leave(User user);

        void Clear();
    }
}