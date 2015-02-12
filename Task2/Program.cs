#define SIMPLE_JSON_DYNAMIC

using RestSharp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Task2
{
    public class Test2
    {
        public bool HasTitle { get; set; }

        public string Title { get; set; }

        public List<dynamic> Entries { get; set; }

        public IEnumerable<Test2Entry> TypedEntries { get { return Entries.Select(x => new Test2Entry(x)); } }
    }

    public class Test2FileInfo
    {
        public bool ThumbExists { get; set; }

        public DateTime ClientMtime { get; set; }

        public int Bytes { get; set; }

        public string Path { get; set; }
    }

    public class Test2Entry
    {
        public string Path { get; set; }

        public Test2FileInfo FileInfo { get; set; }

        public Test2Entry(dynamic entry)
        {
            Path = entry[0];
            var info = entry[1];
            FileInfo = new Test2FileInfo 
            {
                Bytes = (int)info["bytes"],
                ThumbExists = info["thumb_exists"],
                Path = info["path"],
                ClientMtime = DateTime.Parse((string)info["client_mtime"])
            };
        }
    }

    class Program
    {

        static void Main(string[] args)
        {
            var json = System.IO.File.ReadAllText("test2.json");
            var response = new RestResponse() { ContentType = "application/json", Content = json };
            var serializer = new RestSharp.Deserializers.JsonDeserializer();
            var result = serializer.Deserialize<Test2>(response);
            Console.WriteLine(result.TypedEntries.First().FileInfo.ClientMtime);
        }
    }
}
