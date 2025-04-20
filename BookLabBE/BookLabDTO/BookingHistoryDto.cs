using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabDTO
{
    public class BookingHistoryDto
    {
        public string Booker { get; set; } // Lấy từ AccountName trong bảng Account
        public string RoomNo { get; set; }
        public string Date { get; set; }
        public string Note { get; set; }
        public string Slot { get; set; } // Sẽ là số (1, 2, ...) hoặc "Old Slot" nếu Slot = -1
        public string TimeRange { get; set; } // Cột mới: Hiển thị StartTime - EndTime nếu Slot = -1
    }
}
