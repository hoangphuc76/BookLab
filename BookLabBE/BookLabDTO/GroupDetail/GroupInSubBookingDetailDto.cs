using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabDTO.GroupDetail
{
    public class GroupInSubBookingDetailDto
    {
        public Guid GroupInSubBookingId { get; set; }
        public DateTime Date { get; set; }
        public DateTime DateBooking { get; set; }
        public int Approve { get; set; }
    }
}
