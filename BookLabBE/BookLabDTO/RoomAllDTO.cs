using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabDTO
{
    public class RoomAllDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string RoomNumber { get; set; }
        public string Avatar { get; set; }
        public double? Rating { get; set; }
        public int Capacity { get; set; }
        public int GroupSize { get; set; }
        public string TypeSlot { get; set; }
        public bool OnlyGroupStatus { get; set; }
        public int RoomStatus { get; set; }
        public Guid? ManagerId { get; set; }

        public Guid? CategoryRoomId { get; set; }

        public Guid? BuildingId { get; set; }
    }
}
