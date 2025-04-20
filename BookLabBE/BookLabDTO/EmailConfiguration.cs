using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace BookLabDTO
{
    public class EmailConfiguration
    {
        [JsonPropertyName("From")]
        public string From { get; set; }

        [JsonPropertyName("FromName")]
        public string FromName { get; set; }

        [JsonPropertyName("SmtpServer")]
        public string SmtpServer { get; set; }

        [JsonPropertyName("Port")]
        public int Port { get; set; }

        [JsonPropertyName("UseSsl")]
        public bool UseSsl { get; set; }

        [JsonPropertyName("Username")]
        public string Username { get; set; }

        [JsonPropertyName("Password")]
        public string Password { get; set; }
    }
}
