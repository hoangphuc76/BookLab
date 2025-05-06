using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabDTO
{
    public class GroupInBookingDTO
    {
        public Guid SubBookingId { get; set; }

        public Guid GroupId { get; set; }
    }
}
