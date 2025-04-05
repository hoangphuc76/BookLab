using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabModel
{
    public class Token
    {
        public Token()
        {
            this.GeneratedOn = DateTime.Now;
        }

        public string access_token {  get; set; }

        public int expires_in { get; set; }

        public string token_type { get; set; }

        public string scope { get; set; }

        public string refresh_token { get; set; }

        public DateTime GeneratedOn { get; set; }

        public bool IsTokenExpired { 
            get
            {
                return this.GeneratedOn.AddSeconds(this.expires_in) <= DateTime.Now;
            }
        }
    }
}
