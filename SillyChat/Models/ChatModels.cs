using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SillyChat.Models
{
    public class User
    {
        public int Id { get; set; }

        public string AvatarUrl { get; set; }

        public string Name { get; set; }
    }

    public class Message
    {
        public int Id { get; set; }

        public User Author { get; set; }

        public string Text { get; set; }

        public DateTime Date { get; set; }
    }
}