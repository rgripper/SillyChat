namespace SillyChat.Models
{
    using System;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity;
    using System.Linq;

    public class ChatDbContext : DbContext
    {
        public ChatDbContext()
            : base("name=Chat")
        {
            Database.SetInitializer<ChatDbContext>(new CreateDatabaseIfNotExists<ChatDbContext>());
        }

        // Add a DbSet for each entity type that you want to include in your model. For more information 
        // on configuring and using a Code First model, see http://go.microsoft.com/fwlink/?LinkId=390109.

        public virtual DbSet<User> Users { get; set; }

        public virtual DbSet<Participant> Participants { get; set; }

        public virtual DbSet<Message> Messages { get; set; }
    }

    public class User
    {
        public int Id { get; set; }

        public string AvatarUrl { get; set; }

        public string Name { get; set; }
    }

    public class Participant
    {
        [Key]
        [ForeignKey("User")]
        public int Id { get; set; }

        public User User { get; set; }
    }

    public class Message
    {
        public int Id { get; set; }

        [ForeignKey("Author")]
        public int AuthorId { get; set; }

        public User Author { get; set; }

        public string Text { get; set; }

        public DateTime Date { get; set; }
    }
}