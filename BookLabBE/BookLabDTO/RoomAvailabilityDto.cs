using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabDTO
{
    public class RoomAvailabilityDto
    {
        public string TypeSlot { get; set; }
        public string RoomNo { get; set; }
        public int Capacity { get; set; }
        public string Slot { get; set; }
        public int TotalSlot { get; set; }
        public string Date { get; set; }
    }
}
