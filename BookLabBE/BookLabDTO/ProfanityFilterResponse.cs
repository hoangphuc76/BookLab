using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabDTO
{
    public class ProfanityFilterResponse
    {
        public string Original { get; set; }

        public string Censored { get; set; }

        public bool HasProfanity { get; set; }
    }
}
