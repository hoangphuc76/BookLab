using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabDTO
{
    public class RoomDTO
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public string? CategoryRoom { get; set; }
        public int? Status { get; set; }
        public double? Rating { get; set; }
        public int? Capacity { get; set; }
        public List<string> ImageUrls { get; set; }
        // Các thuộc tính khác không gây vòng lặp
    }
}
