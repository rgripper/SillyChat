using Microsoft.AspNet.SignalR;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Owin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Web;

namespace SillyChat
{
    public class AssemblyCamelCasePropertyNamesContractResolver : DefaultContractResolver
    {
        public AssemblyCamelCasePropertyNamesContractResolver()
        {
            AssembliesToInclude = new HashSet<Assembly>();
        }

        public HashSet<Assembly> AssembliesToInclude { get; set; }

        protected override JsonProperty CreateProperty(MemberInfo member, MemberSerialization memberSerialization)
        {
            var jsonProperty = base.CreateProperty(member, memberSerialization);
            Type declaringType = member.DeclaringType;
            if (AssembliesToInclude.Contains(declaringType.Assembly))
            {
                jsonProperty.PropertyName = jsonProperty.PropertyName[0].ToString().ToLower() + jsonProperty.PropertyName.Substring(1);
            }
            return jsonProperty;
        }
    }

    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            app.MapSignalR();

            var serializer = new JsonSerializer
            {
                ContractResolver = new AssemblyCamelCasePropertyNamesContractResolver
                {
                    AssembliesToInclude = { typeof (Startup).Assembly }
                }
            };

            GlobalHost.DependencyResolver.Register(typeof(JsonSerializer), () => serializer);
        }
    }
}