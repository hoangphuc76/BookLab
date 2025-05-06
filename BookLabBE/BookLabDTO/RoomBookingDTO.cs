using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabDTO
{
    public class RoomBookingDTO
    {
        public Guid Id { get; set; }

        public string RoomNumber { get; set; }

        public string BuildingName { get; set; }

        public string ManagerEmail { get; set; }

        public int Capacity { get; set; }

        public int GroupSize { get; set; }

        public bool OnlyGroupStatus { get; set; }
    }
}
