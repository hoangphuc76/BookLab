using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabDTO
{
    public class DashboardSummaryDto
    {
        public int TotalBookings { get; set; }
        public int ApprovedBookings { get; set; }
        public int CancelledBookings { get; set; }
        public int UniqueTeachers { get; set; }
    }
}
