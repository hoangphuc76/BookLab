using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabDTO
{
    public class RoomUsageDto
    {
        public string RoomName { get; set; }
        public string RoomNumber { get; set; }
        public int UsageCount { get; set; }
        public int Capacity { get; set; }
    }
}
