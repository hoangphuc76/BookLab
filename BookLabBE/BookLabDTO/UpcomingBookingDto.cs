using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabDTO
{
    public class UpcomingBookingDto
    {
        public string Booker { get; set; }
        public string RoomNo { get; set; }
        public string Note { get; set; }
        public string Date { get; set; } // Thêm ngày để người dùng biết thời gian booking
        public int Status { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
    }
}
